import PagePlaceholder from '../components/PagePlaceholder'

export default function Posts() {
  return (
    <PagePlaceholder
      title="Posts"
      description="The post library will live here — a searchable, filterable list of every post."
      stats={[
        { label: 'Total Posts', value: 0 },
        { label: 'Scheduled', value: 0 },
        { label: 'Drafts', value: 0 },
        { label: 'Posted', value: 0 },
      ]}
    />
  )
}
