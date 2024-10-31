import { ObjectInputStream, JavaSerializable } from 'java-object-serialization'

export default class JavaDate implements JavaSerializable {
  time: bigint = 0n

  readObject(stream: ObjectInputStream): void {
    this.time = stream.readLong()
  }

  readResolve(): any {
    return new Date(Number(this.time))
  }
}
