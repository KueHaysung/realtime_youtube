'use client';
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { GiFlyingFlag } from 'react-icons/gi';

interface AppointmentSideBaroptionsProps {
  sessionId: string
  initialUnseenRequestCount: number
}

const AppointmentSideBaroptions: FC<AppointmentSideBaroptionsProps> = ({
  sessionId,
  initialUnseenRequestCount,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  )

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`appointment:${sessionId}:incoming_appointment`)
    )
    pusherClient.subscribe(toPusherKey(`appointment:${sessionId}:appointments`))

    const appointmentRequestHandler = () => {
      setUnseenRequestCount((prev) => prev + 1)
    }

    const addedAppointmentHandler = () => {
      setUnseenRequestCount((prev) => prev - 1)
    }

    pusherClient.bind('incoming_appointment', appointmentRequestHandler)
    pusherClient.bind('new_appointment', addedAppointmentHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`appointment:${sessionId}:incoming_appointment`)
      )
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:appointment`))

      pusherClient.unbind('new_appointment', addedAppointmentHandler)
      pusherClient.unbind('incoming_appointment', appointmentRequestHandler)
    }
  }, [sessionId])

  return (
    <Link
      href='/dashboard/games/join'
      className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
      <div className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
        <GiFlyingFlag className='h-4 w-4' />
      </div>
      <p className='truncate'>Join Games</p>

      {unseenRequestCount > 0 ? (
        <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600'>
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  )
}

export default AppointmentSideBaroptions;
