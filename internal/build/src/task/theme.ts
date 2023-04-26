import path from 'path';
import gulp from 'gulp';
import chalk from 'chalk';
import through2 from 'through2';
import { epOutput, themeRoot, epRoot } from '@ent-core/build-utils';
import { generateModifyVars } from '../plugins/generate-modify-vars';
import Less from 'gulp-less';
import { lessPlugin } from '../plugins/less';
import { resolveConfig, ResolvedConfig } from 'vite';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';
import cssnano from 'gulp-cssnano';
import { cssImport } from '../plugins/css-import';

type CompileLessOption = {
  src: string;
  out: string;
  cwd: string;
  dest: string;
  preLoad?: string;
  dark?: boolean;
  resolvedConfig: ResolvedConfig;
};

export const buildTheme = async () => {
  const resolvedConfig = await resolveConfig(
    {
      configFile: path.resolve(process.cwd(), 'vite.theme.config.ts'),
    },
    'build',
    'production',
  );
  await compileLess({
    cwd: `${themeRoot}`,
    src: `index.less`,
    out: `app`,
    dest: `${epOutput}/dist`,
    dark: false,
    resolvedConfig,
  });
  await compileLess({
    cwd: `${themeRoot}`,
    src: `index.less`,
    out: `app-theme-dark`,
    dest: `${epOutput}/dist`,
    dark: true,
    resolvedConfig,
  });
  copyThemeSource();
  copyThemeExceptSource();
};

export async function compileLess(options: CompileLessOption) {
  const { cwd, resolvedConfig } = options;
  const { src, out, dest, dark } = options;
  const resolvedLessFile = path.resolve(cwd, src);
  // Do less compile
  const preLoadFile = path.resolve(themeRoot, 'config.less');
  const lessOpts: Less.Options = {
    sourceMap: true,
    inline: true,
    filename: resolvedLessFile,
    modifyVars: generateModifyVars(dark, preLoadFile),
    plugins: [lessPlugin(resolvedLessFile, resolvedConfig)],
    javascriptEnabled: true,
  };

  gulp
    .src([resolvedLessFile])
    .pipe(Less(lessOpts))
    .pipe(cssImport(resolvedConfig))
    .pipe(cssnano())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(
      cleanCSS({}, (details) => {
        console.log(
          `${chalk.cyan(`${dest}/${out}.css`)}: ${chalk.yellow(
            details.stats.originalSize / 1000,
          )} KB -> ${chalk.green(details.stats.minifiedSize / 1000)} KB`,
        );
      }),
    )
    .pipe(
      rename((path) => {
        path.basename = `${out}`;
      }),
    )
    .pipe(gulp.dest(dest));
}

export function copyThemeSource() {
  return gulp
    .src(`${epRoot}/theme/**/*.less`)
    .pipe(
      // 修改文件的别名
      through2.obj(function (file, encoding, next) {
        if (file.path.match(/\/app\.less$/)) {
          const content = file.contents.toString();
          file.contents = Buffer.from(content.replaceAll('@ent-core', '../es'));
        } else {
          const content = file.contents.toString();
          file.contents = Buffer.from(content.replaceAll('@ent-core', 'fe-ent-core'));
        }
        this.push(file);
        next();
      }),
    )
    .pipe(gulp.dest(`${epOutput}/theme`));
}

export function copyThemeExceptSource() {
  return gulp
    .src(`${epRoot}/{components,directives,layouts,views}/**/*.{less,css}`)
    .pipe(
      // 修改文件的别名
      through2.obj(function (file, encoding, next) {
        const content = file.contents.toString();
        file.contents = Buffer.from(content.replaceAll('@ent-core', 'fe-ent-core'));
        this.push(file);
        next();
      }),
    )
    .pipe(gulp.dest(`${epOutput}/es`));
}
