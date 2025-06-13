const markdownComponents = {
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto">
      <table
        className="min-w-full border-separate border-spacing-y-1 rounded-lg overflow-hidden shadow-md text-xs md:text-sm"
        {...props}
      />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead className="bg-blue-700 text-white border-b border-blue-400" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th
      className="px-2 md:px-4 py-1 md:py-2 text-left border-b border-blue-400 text-xs md:text-sm"
      {...props}
    />
  ),
  tbody: ({ node, ...props }) => <tbody {...props} />,
  tr: ({ node, ...props }) => (
    <tr className="bg-gray-800 hover:bg-gray-700 border-b border-gray-700" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td
      className="px-2 md:px-4 py-1 md:py-2 align-top border-b border-gray-700 text-xs md:text-sm"
      {...props}
    />),
  ul: ({ node, ...props }) => (
    <ul className="list-disc list-inside space-y-1 pl-4" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal list-inside space-y-1 pl-4" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="mb-1 leading-relaxed" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-2 leading-relaxed text-gray-300" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 border-blue-600 pl-4 italic text-gray-400 my-4" {...props} />
  ),
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code className="bg-gray-700 rounded px-1 py-0.5 font-mono text-sm" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-gray-900 rounded p-4 overflow-x-auto text-sm" {...props}>
        <code>{children}</code>
      </pre>
    );
  },
};

export default markdownComponents;
