"use client";
import { FC, useState } from "react";
import Button from "@/components/ui/Button";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Games1,
  createAppointmentValidator,
} from "@/lib/validations/create-appointment";
interface CreateGameProps {}
// type FormType = { name: string; info: string ;type:string};
const formInfos = [
  { name: "startTime", info: "开始时间", type: "datetime-local" },
  { name: "endTime", info: "结束时间", type: "datetime-local" },
  { name: "gameType", info: "游戏类型", type: "checkbox" },
  { name: "countFloor", info: "人数下限", type: "number" },
  { name: "countCeiling", info: "人数上限", type: "number" },
  { name: "location", info: "地点", type: "text" },
  { name: "describe", info: "描述", type: "text" },
] as const;

// type FormType = (typeof formInfos)[number];

type FormData = z.infer<typeof createAppointmentValidator>;
// const games=Object.keys(Games1)
// console.log(games)
const games = Object.keys(Games1).filter((item) => isNaN(Number(item)));
const CreateGame: FC<CreateGameProps> = ({}) => {
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false);
  const [hadSent, setHadSent] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createAppointmentValidator as any),
  });
  const createAppointment = async (app: FormData) => {
    console.log("开始添加数据");

    try {
      const validAppointment = createAppointmentValidator.parse(app);
      await axios.post("/api/games/create", validAppointment);
      setShowSuccessState(true);
    } catch (error) {
      console.log(error);
      if (error instanceof z.ZodError) {
        setError("root", { message: "ZodError:" + error.message });
        return;
      }
      if (error instanceof AxiosError) {
        setError("root", { message: "axioError:" + error.response?.data });
        return;
      }

      setError("root", { message: "Something went wrong." });
    }
  };
  const onSubmit = async (data: FormData) => {
    if (showSuccessState) setHadSent(true);
    if (hadSent) return;
    console.log(data);
    await createAppointment(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
      <div>
        {formInfos.map((formInfo) => {
          return (
            <div key={formInfo.name} className="mt-2  gap-4">
              <label
                htmlFor={formInfo.name}
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {formInfo.info}
              </label>
              <p className="mt-1 text-sm text-red-600">
                {errors[formInfo.name]?.message}
              </p>
              {formInfo.type != "checkbox" ? (
                formInfo.type == "number" ? (
                  <input
                    {...register(`${formInfo.name}`, { valueAsNumber: true })}
                    type={formInfo.type}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder={formInfo.info}
                  />
                ) : formInfo.type == "datetime-local" ? (
                  <input
                    {...register(`${formInfo.name}`, { valueAsDate: true })}
                    type={formInfo.type}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder={formInfo.info}
                  />
                ) : (
                  <input
                    {...register(`${formInfo.name}`, { valueAsDate: false })}
                    type={formInfo.type}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder={formInfo.info}
                  />
                )
              ) : (
                games.map((game) => {
                  return (
                    <label key={game} htmlFor="formInfo.name">
                      <input
                        {...register(`${formInfo.name}`)}
                        type={formInfo.type}
                        className=" rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder={formInfo.info}
                        value={game}
                      />
                      {game}
                    </label>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
      <Button>创建</Button>

      {showSuccessState ? (
        hadSent ? (
          <p className="mt-1 text-sm text-red-600">
            已经创建成功，请勿重复提交
          </p>
        ) : (
          <p className="mt-1 text-sm text-green-600">创建成功!</p>
        )
      ) : null}
    </form>
  );
};

export default CreateGame;
