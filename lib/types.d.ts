export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
}

export interface TwilioMessage {
  sid: string
  author: string
  body: string
  dateCreated: string
  media?: Array<{
    sid: string
    filename: string
    contentType: string
    size: number
    url: string
  }>
}
