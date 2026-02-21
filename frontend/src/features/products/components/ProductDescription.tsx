import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

type Props = { md?: string };

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "u"],
};

export default function ProductDescription({ md }: Props) {
  if (!md) return null;

  return (
    <div className="mt-4 text-justify">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
        components={{
          h3: ({ children }) => (
            <h3 className="text-acloblue font-semibold text-lg mt-5 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-600 leading-relaxed mb-3">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 text-gray-600 space-y-2 mb-3">
              {children}
            </ul>
          ),
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-800">{children}</strong>
          ),
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}
