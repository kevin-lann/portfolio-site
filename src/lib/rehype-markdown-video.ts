const VIDEO_SRC = /\.(mp4|webm|ogg)(\?.*)?$/i;

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const isVideoSrc = (src: unknown): src is string =>
  typeof src === 'string' && VIDEO_SRC.test(src);

const transformImagesToVideos = (node: HastNode) => {
  if (node.type === 'element' && node.tagName === 'img' && isVideoSrc(node.properties?.src)) {
    const { src, alt } = node.properties ?? {};

    node.tagName = 'video';
    node.properties = {
      src,
      controls: true,
      playsinline: true,
      preload: 'metadata'
    };

    if (typeof alt === 'string' && alt.length > 0) {
      node.properties['aria-label'] = alt;
    }

    node.children = [];
  }

  node.children?.forEach(transformImagesToVideos);
};

export const rehypeMarkdownVideo = () => (tree: HastNode) => {
  transformImagesToVideos(tree);
};
