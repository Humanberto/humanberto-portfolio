export type {
  AdvocateConfig,
  AdvocateClientConfig,
  AdvocateFacts,
  AdvocateFactItem,
  AdvocateToolFlags,
  AdvocateCapabilities,
  AdvocateIntegrations,
  CapturedLead,
  FitAnalysis,
  FitMatchItem,
  FitGapItem,
} from "./config";

export { AdvocateChat, type AdvocateChatProps } from "./client/advocate-chat";
export { ChatLauncher, type ChatLauncherProps } from "./client/chat-launcher";
export { FitAnalyzer, type FitAnalyzerProps } from "./client/fit-analyzer";
export { buildTranscript } from "./client/transcript";
