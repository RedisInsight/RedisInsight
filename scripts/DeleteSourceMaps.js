import { join } from 'path';
import rimraf from 'rimraf';

export default function deleteSourceMaps() {
  rimraf.sync(join(__dirname, '../redisinsight/ui/dist/*.js.map'));
  rimraf.sync(join(__dirname, '../redisinsight/ui/*.js.map'));
}
