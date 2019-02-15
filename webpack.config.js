const path = require("path");
const env = process.env.NODE_ENV || "production";
const package = require("./package.json");
const meta = require("./meta.json");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: env,
    entry: path.resolve(__dirname,"src","index.tsx"),
    output: {
        filename: "client.js",
        path: path.resolve((__dirname, "bin"))
    },
    devtool: env==="production" ? false : "source-map",
    resolve: {
        extensions: [
            ".ts",
            ".tsx",
            ".js",
            ".json"
        ]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.(png|svg|jpg|ico)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]"
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: package.name,
            filename: `200.html`,
            favicon: "favicon.png",
            meta
        })
    ]
};