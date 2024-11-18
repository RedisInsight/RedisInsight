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
    let timeValue: number

    // Handle two's complement conversion for negative numbers
    if (this.time > 9223372036854775807n) {
      // If the number is larger than MAX_LONG, it's a negative number in two's complement
      timeValue = Number(this.time - 18446744073709551616n)
    } else {
      timeValue = Number(this.time)
    }

    const date = new Date(timeValue)

    // Validate the date
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid date value: ${timeValue} (original: ${this.time})`)
    }

    return date
  }
}
