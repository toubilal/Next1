/** @type {import('next').NextConfig} */
var nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '4mb', // زدنا الحجم إلى 4 ميجابايت بدلاً من 1
        },
    },
};
module.exports = nextConfig;
