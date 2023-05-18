import { build, createServer } from 'vite';
import getSiteDevConfig from '../../configs/vite.site';
import type { ConfigEnv } from 'vite';

async function run(config: ConfigEnv, port: number) {
  const { command, mode } = config;
  const siteConfig = await getSiteDevConfig({
    command,
    mode,
    ...(command === 'serve' && {
      overrides: {
        server: {
          port,
        },
      },
    }),
  });
  //不重文件加载配置
  siteConfig.configFile = false;
  if (command === 'build') {
    await build(siteConfig);
  } else {
    const server = await createServer(siteConfig);
    await server.listen();
    server.printUrls();
  }
}

export default run;
