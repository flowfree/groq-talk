import ReactMarkdown from 'react-markdown'
import { CodeBlock } from './code-block'

export function Markdown({
  content
}: {
  content: string
}) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="my-3 font-semibold text-2xl tracking-tight" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h1 className="my-4 font-semibold text-xl tracking-tight" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h1 className="my-4 font-semibold text-base tracking-tight" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ul className="my-4 ml-8 list-decimal" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="my-4 ml-8 list-disc" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="pl-2 list-outside" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="my-4" {...props} />
        ),
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <CodeBlock language={match[1]} className="my-4">
              {children}
            </CodeBlock>
          ) : (
            <code {...props} className={className + ` px-2 bg-gray-200 text-sm`}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
