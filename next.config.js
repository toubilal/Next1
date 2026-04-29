/** @type {import('next').NextConfig} */ var nextConfig = {
    // 1. الإعدادات الموجودة عندك مسبقاً
    experimental: {
        serverActions: {
            bodySizeLimit: '4mb',
        },
    },
    // 2. الإعدادات الجديدة لحل مشكلة الصور
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'mxdizhrryqtlqepavdiq.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};
module.exports = nextConfig;
