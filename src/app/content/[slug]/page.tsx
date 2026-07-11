import { notFound } from "next/navigation";
import { getTopicBySlug, getTopicContext } from "@/lib/content";
import { ContentView } from "@/components/ContentView";

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default function TopicPage({ params }: Props) {
  const topic = getTopicBySlug(params.slug);
  if (!topic) notFound();

  const ctx = getTopicContext(params.slug);

  return (
    <ContentView
      topic={topic}
      breadcrumb={ctx ? { section: ctx.section.name, subsection: ctx.subsection.name } : null}
    />
  );
}
