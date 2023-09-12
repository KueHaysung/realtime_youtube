"use client";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { request } from "http";
interface AppointmentRequestsProps {
  incomingAppointment: Appointment[];
  sessionId: string;
}

const AppointmentRequests: FC<AppointmentRequestsProps> = ({
  incomingAppointment,
  sessionId,
}) => {
  const router = useRouter();
  const [appointmentRequests, setAppointmentRequests] = useState<Appointment[]>(
    incomingAppointment.filter(
      (request) => !request.memberId.includes(sessionId)
    )
  );
  const [joinedAppointmentRequests, setJoinedAppointmentRequests] = useState<
    Appointment[]
  >(
    incomingAppointment.filter((request) =>
      request.memberId.includes(sessionId)
    )
  );
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`incoming_appointment`));
    const appointmentRequestHandler = (appointment: Appointment) => {
      setAppointmentRequests((prev) => {
        return prev.filter((request) => !request.memberId.includes(sessionId));
      });
      setAppointmentRequests((prev) => {
        return [...prev, appointment];
      });
    };

    pusherClient.bind("incoming_appointment", appointmentRequestHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`incoming_appointment`));
      pusherClient.unbind("incoming_appointment", appointmentRequestHandler);
    };
  }, [sessionId]);

  const acceptGame = async (gameId: string) => {
    await axios.post("/api/games/join", { id: gameId });
    if (!sessionId) return;
    setAppointmentRequests((prev) => {
      return prev
        .map((request) => {
          if (request.id == gameId) {
            request.memberId.push(sessionId);
            return request;
          } else {
            return request;
          }
        })
        .filter((request) => !request.memberId.includes(sessionId));
    });
    setJoinedAppointmentRequests((prev) => {
      return prev
        .map((request) => {
          if (request.id == gameId) {
            request.memberId.push(sessionId);
            return request;
          } else {
            return request;
          }
        })
        .filter((request) => request.memberId.includes(sessionId));
    });
    router.refresh();
  };

  // const denyFriend = async (senderId: string) => {
  //   await axios.post("/api/friends/deny", { id: senderId });

  //   setFriendRequests((prev) =>
  //     prev.filter((request) => request.senderId !== senderId)
  //   );

  //   router.refresh();
  // };

  return (
    <>
      {appointmentRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        <div>
          <div className="container px-4 mx-auto">
            <div className="flex flex-col mt-6">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                          >
                            join
                          </th>
                          {Object.keys(appointmentRequests[0]).map(
                            (request) => {
                              return (
                                <th
                                  key={request}
                                  scope="col"
                                  className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                                >
                                  <span>{request}</span>
                                </th>
                              );
                            }
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900"></tbody>
                      {appointmentRequests.map((appoint) => {
                        return (
                          <tr key={appoint.id}>
                            <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                              <button
                                className="border border-indigo-500 bg-indigo-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline"
                                onClick={() => acceptGame(appoint.id)}
                              >
                                参加
                              </button>
                            </td>

                            {Object.entries(appoint).map((key, value) => {
                              return (
                                <td
                                  key={value}
                                  className="px-4 py-4 text-sm font-medium whitespace-nowrap"
                                >
                                  <h2 className="font-medium text-gray-800 dark:text-white ">
                                    {key[1]}
                                  </h2>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
 
        </div>
      )}
       {joinedAppointmentRequests.length === 0 ? (        <p className="text-sm text-zinc-500">Nothing to show here...</p>):(<div>         <h1 className=" font-bold text-5xl mb-8 pt-9">已参加</h1>
          <div className="container px-4 mx-auto">
            <div className="flex flex-col mt-6">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {/* <th
                            scope="col"
                            className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                          >
                            join
                          </th> */}
                          {Object.keys(joinedAppointmentRequests[0]).map(
                            (request) => {
                              return (
                                <th
                                  key={request}
                                  scope="col"
                                  className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                                >
                                  <span>{request}</span>
                                </th>
                              );
                            }
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900"></tbody>
                      {joinedAppointmentRequests.map((appoint) => {
                        return (
                          <tr key={appoint.id}>
                            {/* <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                              <button
                                className="border border-indigo-500 bg-indigo-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline"
                                onClick={() => acceptGame(appoint.id)}
                              >
                                参加
                              </button>
                            </td> */}

                            {Object.entries(appoint).map((key, value) => {
                              return (
                                <td
                                  key={value}
                                  className="px-4 py-4 text-sm font-medium whitespace-nowrap"
                                >
                                  <h2 className="font-medium text-gray-800 dark:text-white ">
                                    {key[1]}
                                  </h2>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

       </div>)}
    </>
  );
};
export default AppointmentRequests;
