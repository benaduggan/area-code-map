{ pkgs ? import
    (fetchTarball {
      # nixup: pin=jpetrucciani/nix;
      name = "jpetrucciani-2026-09-15";
      url = "https://github.com/jpetrucciani/nix/archive/e47a265886fa3e9fa4c3f398b1d3b90f5ec31db9.tar.gz";
      sha256 = "04nl5kz17xc5fr7xxxi4qj3x47shp2xs4hamia8nyk564pf9jwiq";
    })
    { }

}:
let
  name = "hometowns";

  envVars = {
    NIXUP = "0.0.15";
  };
  tools = with pkgs; {
    cli = [
      jfmt
      nixup
    ];
    bun = [ bun ];
    scripts = pkgs.lib.attrsets.attrValues scripts;
  };

  scripts = with pkgs; { };
  paths = pkgs.lib.flatten [ (builtins.attrValues tools) ];
  env = pkgs.buildEnv {
    inherit name paths; buildInputs = paths;
  };
in
(env.overrideAttrs (old: {
  inherit name;
  env = (old.env or { }) // envVars;
})) // { inherit scripts; }
