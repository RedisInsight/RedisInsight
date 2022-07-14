yarn --cwd tests/e2e install

# mount and copy app sources
sudo hdiutil attach ./release/RedisInsight-*-x64.dmg
sudo cp -R /Volumes/RedisInsight-*/RedisInsight-v2.app /Applications
sudo hdiutil unmount /Volumes/RedisInsight-*/

  # run rte
  #docker run -d -p 8100:6379 redislabs/redismod
  #docker run -d -p 8101:6379 redis:5
  #docker run -d -p 8102:6379 redislabs/redismod
  #docker run -d -p 8101:6379 redis:5

  #docker-compose -f tests/e2e/docker-compose.yml create --force-recreate
  #docker-compose -f tests/e2e/docker-compose.yml run init-rte && \

# run tests
#sudo
COMMON_URL=/Applications/RedisInsight-v2.app/Contents/Resources/app.asar/index.html \
ELECTRON_PATH=/Applications/RedisInsight-v2.app \
yarn --cwd tests/e2e dotenv -e .desktop.env yarn --cwd tests/e2e test:desktop:ci
