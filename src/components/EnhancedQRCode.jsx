import React from "react";

const EnhancedQRCode = () => (
  <div className="inline-flex flex-col items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
    <div className="bg-white p-3 rounded-lg">
      <img
        src="/downloadAwaazQrCode.png"
        alt="Download Awaaz — scan QR code"
        className="w-44 h-44 object-contain"
        loading="lazy"
      />
    </div>
    <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
      Scan to download
    </p>
  </div>
);

export default EnhancedQRCode;
