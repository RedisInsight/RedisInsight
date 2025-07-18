declare module 'socket.io-mock' {
  export default class MockedSocket {
    socketClient: {
      emit: (event: string, data?: any) => void
      on: (event: string, callback: (data: any) => void) => void
      connected: boolean
    }

    on: (event: string, callback: (data: any) => void) => void

    emit: (event: string, data?: any) => void
  }
}
