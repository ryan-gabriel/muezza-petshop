export default function TestimonialQuote({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <blockquote className="border-l-4 border-[#8ed0df] pl-4 text-[#636270] leading-relaxed">
      {children}
    </blockquote>
  );
}
