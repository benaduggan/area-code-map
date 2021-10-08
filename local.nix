
scope: with scope;
let
  nodejs = nodejs-16_x;
in [
    (yarn.override { inherit nodejs; })
  nodejs
  nodePackages.prettier
  watchexec
]
