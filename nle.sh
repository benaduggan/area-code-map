#!/bin/sh
set -e
rev=ccf0345ec2a29335e5b5f22e63d719ac6b89ec5f
result=${NLE_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/nle}/.pinned/$rev
url=https://github.com/kwbauson/cfg/archive/$rev.tar.gz
local_nix_conf=$(dirname "$0")/nix/nix.conf

if [ -e "$local_nix_conf" ];then
  export NIX_CONFIG=$(< "$local_nix_conf")
fi

if [ ! -e "$result" ];then
  mkdir -p "$(dirname "$result")"
  nix build --file "$url" nle.unwrapped --out-link "$result"
fi

exec "$result"/bin/nle "$@"
