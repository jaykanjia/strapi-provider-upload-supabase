// supabase-s3 provider
"use strict";

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const getFileKey = ({ directory, file }) => {
  const path = file.path ? `${file.path}/` : "";
  const fname = file.name.replace(/\.[^/.]+$/, "");

  const filename = `${path}${fname}_${file.hash}${file.ext}`;

  if (!directory) return filename;

  return `${directory}/${filename}`.replace(/^\//g, "");
};

module.exports = {
  provider: "supabase",
  name: "Supabase Storage",
  init: (config) => {
    const apiUrl = config.apiUrl;
    const apiKey = config.apiKey;

    const bucket = config.bucket || "strapi-uploads";
    const options = config.options || undefined;
    let directory = (config.directory || "").replace(/(^\/)|(\/$)/g, "");

    const year = new Date().getFullYear().toString();
    const month = (new Date().getMonth() + 1).toString();

    if (!directory && options?.dynamic_directory) {
      directory = `${year}/${month}`;
    }

    delete options?.dynamic_directory;

    const supabase = createClient(apiUrl, apiKey, options);

    return {
      async upload(file, customParams = {}) {
        // upload file to supabase

        // Compute the file key.
        file.hash = crypto.createHash("md5").update(file.hash).digest("hex");

        // Upload the file into storage
        const filePath = getFileKey({ directory, file });

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, Buffer.from(file.buffer, "binary"), {
            cacheControl: "public, max-age=31536000, immutable",
            upsert: true,
            contentType: file.mime,
          });
        if (error) {
          return new Error(error.message);
        } else {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from(bucket)
            .getPublicUrl(getFileKey({ directory, file }));

          file.url = publicUrl;
          delete file.buffer;
        }

        return data.path;
      },

      async delete(file) {
        // delete file from supabase
        const { data, error } = await supabase.storage
          .from(bucket)
          .remove([getFileKey({ directory, file })]);
        if (error) new Error(error.message);

        return null;
      },

      async isPrivate() {
        return true;
      },

      async getSignedUrl(file) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(getFileKey({ directory, file }), 60);

        if (error) return new Error(error.message);

        return { url: data.signedUrl };
      },
    };
  },
};
