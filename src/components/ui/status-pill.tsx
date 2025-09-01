import { cn } from '@/lib/utils'
import { Badge } from './badge'

interface StatusPillProps {
  status: 'active' | 'revoked' | 'inactive' | string
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  const variant = status === 'active' 
    ? 'default' 
    : status === 'revoked' 
      ? 'destructive' 
      : 'secondary'
  
  return (
    <Badge 
      variant={variant}
      className={cn('capitalize', className)}
    >
      {status}
    </Badge>
  )
}

interface BooleanPillProps {
  value: boolean
  trueLabel?: string
  falseLabel?: string
  className?: string
}

export function BooleanPill({ 
  value, 
  trueLabel = 'Yes', 
  falseLabel = 'No',
  className 
}: BooleanPillProps) {
  return (
    <Badge 
      variant={value ? 'default' : 'secondary'}
      className={cn(className)}
    >
      {value ? trueLabel : falseLabel}
    </Badge>
  )
}