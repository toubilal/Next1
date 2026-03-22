"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
// استبدل القيم بالروابط الموجودة في صورتك
var supabaseUrl = 'https://mxdizhrryqtlqepavdiq.supabase.co';
var supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZGl6aHJyeXF0bHFlcGF2ZGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjk3NTUsImV4cCI6MjA4ODg0NTc1NX0.uD1oV6vuvVzew6k0MNeKuYH5RNI9M80Z3eA4k5hbg_8';
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
