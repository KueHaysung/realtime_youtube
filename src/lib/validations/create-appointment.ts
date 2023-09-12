import{z}from 'zod'
import  '@/lib/enums'
export enum Games1 {
  狼人杀 ,
  三国杀 ,
  卡坦岛,
  阿瓦隆,
  马尼拉,
  够级,
  我是大老板,
  小小世界,
  其他
}

export const createAppointmentValidator=z.object({
  
  startTime:z.date(),
  endTime:z.date(),
  gameType:z.array(z.string()),
  countFloor:z.number().gt(1),
  countCeiling:z.number().lt(21),
  location:z.string(),
  describe:z.string()
})
export type CAppointment=z.infer<typeof createAppointmentValidator>