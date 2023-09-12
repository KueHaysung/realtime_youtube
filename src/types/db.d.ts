interface User{
  name:string
  email:string
  image:string
  id:string
}
interface Appointment{
  id:string
  name?:string
  memberId:string[]
  startTime:number
  endTime:number
  selectedGames:string[]
  countCeiling:number
  countFloor:number
  description:string
  location:string
}
interface Message{
  id:string
  senderId:string
  receiverId:string
  text:string
  timestamp:number
}
interface FriendRequest{
  id:string
  senderId:string
  receiverId:string
}