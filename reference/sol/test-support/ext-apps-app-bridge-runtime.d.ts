import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

type EmptyResult = Record<string, never>;
type HostCapabilities = {
  serverTools?: unknown;
  serverResources?: unknown;
  updateModelContext?: { text: EmptyResult };
};
type HostOptions = {
  hostContext?: {
    theme?: "light" | "dark";
    platform?: string;
    displayMode?: "inline" | "fullscreen";
    availableDisplayModes?: Array<"inline" | "fullscreen">;
    containerDimensions?: {
      width?: number;
      height?: number;
      maxHeight?: number;
    };
  };
};

export class PostMessageTransport {
  constructor(targetWindow: Window, sourceWindow: Window);
}

export class AppBridge {
  constructor(
    client: Client,
    hostInfo: { name: string; version: string },
    capabilities: HostCapabilities,
    options?: HostOptions,
  );
  onmessage?: () => Promise<EmptyResult>;
  onupdatemodelcontext?: () => Promise<EmptyResult>;
  onsizechange?: (dimensions: {
    width?: number;
    height?: number;
  }) => Promise<void>;
  oninitialized?: () => void;
  connect(transport: PostMessageTransport): Promise<void>;
  sendToolInput(input: { arguments: Record<string, unknown> }): void;
  sendToolResult(result: unknown): void;
}
