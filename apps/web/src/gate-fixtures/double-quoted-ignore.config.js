// A flat config whose lingui ignore entries are written with DOUBLE quotes,
// KN-367.
//
// The point is the source, not the value: once JavaScript has evaluated it, a
// double-quoted literal and a single-quoted one are the same string, so a test
// that builds the object itself proves nothing about how the config is read.
// The old reader matched single-quoted lines out of the config's TEXT, so an
// entry written this way was invisible to it and could have whitelisted every
// string in the codebase while the test stayed green.
//
// Excluded from lint and coverage with the rest of `gate-fixtures`, which holds
// files that exist to be read rather than to ship.
export default [
  {
    rules: {
      "lingui/no-unlocalized-strings": [
        "error",
        {
          ignore: ["^(rtl|ltr|fa-IR|en-US)$", "^double-quoted$"],
        },
      ],
    },
  },
]
