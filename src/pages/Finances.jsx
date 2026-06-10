import PagePlaceholder from '../components/PagePlaceholder'
import { useWorkspace } from '../context/workspace-context'

export default function Finances() {
  const { activeWorkspace } = useWorkspace()
  const budget = activeWorkspace?.monthlyAdBudget ?? 0

  return (
    <PagePlaceholder
      title="Finances"
      description="The ad spend tracker will live here — budget, expenses, and spend by platform."
      stats={[
        { label: 'Spend This Month', value: '$0' },
        {
          label: 'Remaining Budget',
          value: `$${budget.toLocaleString()}`,
        },
        { label: 'Monthly Budget', value: `$${budget.toLocaleString()}` },
        { label: 'Expenses Logged', value: 0 },
      ]}
    />
  )
}
