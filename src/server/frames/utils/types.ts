import { Frog } from 'frog'

// export type FrameDefinition = {
//   name: string;
//   src: Array<{
//     path: string;
//     handler: (c: FrameContext) => TypedResponse<FrameResponse>;
//   }>;
// };
export type FrameDefinition = {
  name: string
  src: Array<{
    path: string
    handler: (app: Frog) => void
  }>
}
