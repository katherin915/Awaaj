"""
Semantic Clustering Service - Identify and merge duplicate issues
"""

import logging
from typing import List, Dict
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.metrics import silhouette_score
import logging

logger = logging.getLogger(__name__)

class ClusteringService:
    """Service for clustering similar issues to identify duplicates"""
    
    def __init__(self):
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        self.embedder = None
        self.embedding_dim = 384
        
    def load_models(self):
        """Load sentence transformer model"""
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading embedding model: {self.model_name}")
            self.embedder = SentenceTransformer(self.model_name)
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {str(e)}")
            raise
    
    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Get semantic embeddings for texts
        
        Args:
            texts: List of text strings
            
        Returns:
            List of embeddings
        """
        try:
            if not self.embedder:
                self.load_models()
            
            embeddings = self.embedder.encode(texts, show_progress_bar=False)
            return embeddings.tolist()
            
        except Exception as e:
            logger.error(f"Embedding error: {str(e)}")
            raise
    
    def cluster_issues(
        self,
        embeddings: List[List[float]],
        similarity_threshold: float = 0.75,
        min_cluster_size: int = 2
    ) -> List[Dict]:
        """
        Cluster issues based on semantic similarity
        
        Args:
            embeddings: List of issue embeddings
            similarity_threshold: Minimum similarity to merge issues
            min_cluster_size: Minimum issues in a cluster
            
        Returns:
            List of clusters with member IDs
        """
        try:
            embeddings_array = np.array(embeddings)
            
            # Convert similarity threshold to epsilon for DBSCAN
            # similarity = 1 - distance
            eps = 1 - similarity_threshold
            
            # Use DBSCAN for clustering
            clusterer = DBSCAN(eps=eps, min_samples=1)
            labels = clusterer.fit_predict(embeddings_array)
            
            # Organize results
            clusters = {}
            for idx, label in enumerate(labels):
                if label not in clusters:
                    clusters[label] = {
                        'cluster_id': int(label),
                        'members': [],
                        'size': 0,
                        'quality': 0
                    }
                clusters[label]['members'].append(idx)
                clusters[label]['size'] += 1
            
            # Convert to list
            cluster_list = list(clusters.values())
            
            logger.info(f"Created {len(cluster_list)} clusters from {len(embeddings)} issues")
            
            return cluster_list
            
        except Exception as e:
            logger.error(f"Clustering error: {str(e)}")
            raise
    
    def get_cluster_quality(self, clusters: List[Dict]) -> Dict:
        """
        Calculate clustering quality metrics
        
        Args:
            clusters: List of clusters
            
        Returns:
            Dictionary with quality metrics
        """
        try:
            total_clusters = len(clusters)
            total_merged = sum(1 for c in clusters if c['size'] > 1)
            total_issues = sum(c['size'] for c in clusters)
            
            merge_rate = (total_merged / total_clusters * 100) if total_clusters > 0 else 0
            
            return {
                'total_clusters': total_clusters,
                'total_issues': total_issues,
                'total_merged': total_merged,
                'merge_rate': round(merge_rate, 2),
                'avg_cluster_size': round(total_issues / total_clusters, 2) if total_clusters > 0 else 0
            }
        except Exception as e:
            logger.error(f"Quality calculation error: {str(e)}")
            return {}
    
    def find_similar_issues(
        self,
        query_embedding: List[float],
        issue_embeddings: List[List[float]],
        top_k: int = 5,
        min_similarity: float = 0.6
    ) -> List[Dict]:
        """
        Find similar issues to a given query
        
        Args:
            query_embedding: Embedding of query issue
            issue_embeddings: List of all issue embeddings
            top_k: Number of similar issues to return
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of similar issue indices with scores
        """
        try:
            query_array = np.array(query_embedding)
            embeddings_array = np.array(issue_embeddings)
            
            # Calculate cosine similarity
            similarities = np.dot(embeddings_array, query_array) / (
                np.linalg.norm(embeddings_array, axis=1) * np.linalg.norm(query_array) + 1e-10
            )
            
            # Filter by minimum similarity
            valid_idx = np.where(similarities >= min_similarity)[0]
            
            # Sort by similarity
            sorted_idx = valid_idx[np.argsort(-similarities[valid_idx])][:top_k]
            
            results = [
                {
                    'issue_index': int(idx),
                    'similarity': float(similarities[idx])
                }
                for idx in sorted_idx
            ]
            
            return results
            
        except Exception as e:
            logger.error(f"Similarity search error: {str(e)}")
            return []
