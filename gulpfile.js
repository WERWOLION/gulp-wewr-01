

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
    js:source_folder+"/js/*.js", // вся папка
    img:source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp} ",  // **-слушать все подпапки + расширения *.{jpg,png,svg,gif,ico,webp}
    fonts:source_folder+"/fonts/*.ttf",
    
  },
// Отлавлеватель
  watch:{   // Отлавлеватель
    html:source_folder+"/**/*.html",
    css:source_folder+"/scss/**/*.scss", // только 1 файл
    js:source_folder+"/js/**/*.js", // вся папка
    img:source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp} ",  // **-слушать все подпапки + расширения *.{jpg,png,svg,gif,ico,webp}
    
  },
  clean:"./"+ project_folder + "/"

 
}

//============= пачке переменныхъ
let {src, dest} = require("gulp"),
    gulp = require("gulp"),
    browsersync =  require("browser-sync").create(), // плагин сервера
    del =  require("del"), // плагин удаление папки
     // scss = require("gulp-sass"), // плагин 
    sass = require('gulp-sass')(require('sass'));

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
      //.pipe(gulp.dest('./css'))

      .pipe(dest(path.build.css))  // функция команды для гаупа
      .pipe(browsersync.stream())  ;  
}
//  ===END=== + SCSS  ===END===

function watchFiles(params){ //  обн изменений
  gulp.watch([path.watch.html], html); // следить за  html + ,html= функция

}

function clean(params){  // удаление врем ппки
  return del(path.clean);
}

let build = gulp.series(clean , gulp.parallel(css, html) ); // gulp.parallel - выполнение функ поралельно
let watch = gulp.parallel(build, watchFiles, browsSync); // в скобках функции

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
