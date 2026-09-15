declare module "mapshaper" {
  type Inputs = Record<string, string | object | Buffer>;
  type Outputs = Record<string, string | Buffer>;
  const mapshaper: {
    applyCommands(commands: string, inputs?: Inputs): Promise<Outputs>;
  };
  export default mapshaper;
}
