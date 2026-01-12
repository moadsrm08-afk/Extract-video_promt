
export interface FrameData {
  base64: string;
  timestamp: number;
}

export interface GenerationResult {
  prompt: string;
  analysis: string;
  styleTags: string[];
}
