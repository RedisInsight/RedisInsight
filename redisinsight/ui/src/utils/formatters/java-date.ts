import { ObjectInputStream, JavaSerializable } from 'java-object-serialization'

export default class JavaDate implements JavaSerializable {
  // The class name in the serialized data
  static readonly ClassName = 'java.util.Date'

  // The serial version UID followed for 'java.util.Date'
  static readonly SerialVersionUID = '7523967970034938905'

  time: bigint = 0n

  readObject(stream: ObjectInputStream): void {
    this.time = stream.readLong()
  }

  readResolve() {
    return new Date(Number(this.time))
  }
}
