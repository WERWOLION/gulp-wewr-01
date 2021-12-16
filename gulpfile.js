
let project_folder="result";  // конечная папка компиляции
let source_folder="#src";  // папка исходников 

let path={   // пути
  build:{   // результат
    html:project_folder+"/",
    css:project_folder+"/css/",
    js:project_folder+"/js/",
    img:project_folder+"/img/",
    fonts:project_folder+"/fonts/",
    
  },

  src:{   // Исходники
    html: [ source_folder+"/*.html", "!"+ source_folder + "/_*.html"],
    css:source_folder+"/scss/style.scss", // только 1 файл
    js:source_folder+"/js/script.js", //только 1 файл ---  *.js = вся папка 
    img:source_folder+"/img/**/*.+(png|jpg|gif|ico|svg|webp) ",  // **-слушать все подпапки + расширения *.{jpg,png,svg,gif,ico,webp}
    fonts:source_folder+"/fonts/*.ttf",
    
  },
// Отлавлеватель
  watch:{   // Отлавлеватель
    html:source_folder+"/**/*.html",
    css:source_folder+"/scss/**/*.scss", // только 1 файл
    js:source_folder+"/js/**/*.js", // вся папка
    img:source_folder+"/img/**/*.+(png|jpg|gif|ico|svg|webp) ",  // **-слушать все подпапки + расширения *.{jpg,png,svg,gif,ico,webp}
    
  },
  clean:"./"+ project_folder + "/"

 
}

//============= пачке переменныхъ
let {src, dest} = require("gulp"),
    gulp = require("gulp"),
    browsersync =  require("browser-sync").create(), // плагин сервера
    del =  require("del"), // плагин удаление папки

    sass = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'), // сборщик SCSS и css файлов в 1
    cleanCSS = require('gulp-clean-css'), //  очистка и сжатие конечного css файла
    rename = require('gulp-rename'),
    terser = require('gulp-terser');// пл мини js
   imagemin = require('gulp-imagemin');// пл мини IMG

  // END -- let 

const fileinclude = require("gulp-file-include"); // плагин сборки файлов



//END============= пачке переменныхъ===============END

function browsSync(params){
  browsersync.init({ // настройки плагина 
    server:{ baseDir:"./"+ project_folder + "/"},
    port: 3000,
    notify: false
  })
}

//! функция временной сборки на лок сервер
function html () {
  return src(path.src.html)
      .pipe(fileinclude())
      .pipe(dest(path.build.html))  // функция команды для гаупа
      .pipe(browsersync.stream())
      
}
//! ===END=== функция временной сборки ===END===
//======= + SCSS  ================
function css () {
  return src(path.src.css)
       .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
       .pipe(group_media() )

      .pipe(autoprefixer ({ //  команда autoprefixer
           overrideBrowserslist: ["last 5 versions"], // последние 5 версий браузеров
           cascade: true  // стиль написание префиксов = каскад
          })
       )  //  команда autoprefixer

      .pipe(dest(path.build.css))  // выгрузка файла CSS
      .pipe(cleanCSS()) // функция сжатия 
      .pipe(rename({extname:".min.css"})) // функция переименования   
      .pipe(dest(path.build.css))  // выгрузка файла min CSS

      .pipe(browsersync.stream());  
}
//  ===END=== + SCSS  ===END===
function js () {
  return src(path.src.js)
      .pipe(fileinclude())
      .pipe(dest(path.build.js))  // функция команды для гаупа

      .pipe(terser())  // вкл плагина сжатия
      .pipe(rename({extname:".min.js"})) // функция переименования   
      .pipe(dest(path.build.js))  // выгрузка файла min JS
      .pipe(browsersync.stream())
      
}

function image () {
  return src(path.src.img)
      .pipe(imagemin([
          imagemin.gifsicle({interlaced: true}),
          imagemin.mozjpeg({quality: 75, progressive: true}),
          imagemin.optipng({optimizationLevel: 5}), // от 0 до 7
          imagemin.svgo({
                    plugins: [
                      {removeViewBox: false},
                      {cleanupIDs: false}
                    ] // plugins:
                  }) // .svgo
          ]) // imagemin([
      )  //.pipe пл imagemin

      .pipe(dest(path.build.img))  // функция команды для гаупа
      .pipe(browsersync.stream())     
}


function watchFiles(params){ //  обн изменений
  gulp.watch([path.watch.html], html); // следить за  html + ,html= функция
  gulp.watch([path.watch.css], css); // следить за  html + ,html= функция
  gulp.watch([path.watch.js], js); // следить за  js
 // gulp.watch([path.watch.img], image); // следить за картинками
}

function clean(params){  // удаление врем ппки
  return del(path.clean);
}

let build = gulp.series(clean , gulp.parallel(js, css, html) ); // gulp.parallel - выполнение функ поралельно
let watch = gulp.parallel(build, watchFiles, browsSync); // в скобках функции



exports.js = js ;
exports.css = css ;
exports.html = html ;
exports.build = build ;
exports.watch = watch;
exports.default = watch;

// для SASS
exports.watch = function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
};
// для SASS


