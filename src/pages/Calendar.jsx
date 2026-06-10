import PagePlaceholder from '../components/PagePlaceholder'

export default function Calendar() {
  return (
    <PagePlaceholder
      title="Calendar"
      description="The content calendar will live here — see what's posting when, across all platforms."
      stats={[
        { label: 'This Month', value: 0 },
        { label: 'Scheduled', value: 0 },
        { label: 'Drafts', value: 0 },
        { label: 'Ideas', value: 0 },
      ]}
    />
  )
}
