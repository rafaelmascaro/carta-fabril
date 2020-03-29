# Install

```npm install -g gulp-cli@2.2.0 ionic@3.19.1 cordova@8.1.1 bower karma-cli```<br/>
```npm install```<br/>
```bower install```
<br/>
<br/>
Para parar de avisar sobre o update do Ionic CLI<br/>
```ionic --no-interactive -v```

## Browser Run

```gulp web:run -e development```<br/>
```gulp web:run -e development -l``` Para DEBUG WEB local

## Browser Release

```gulp web:release -e sds```<br/>
```gulp web:release -e development```<br/>
```gulp web:release -e qa```<br/>
```gulp web:release -e homolog```<br/>
```gulp web:release -e production```
<br/>
<br/>
Para trocar o valor da versão independente do ambiente, ir no arquivo config/version.json

## Device Run

```gulp android:run -e sds```<br/>
```gulp android:run -e development```<br/>
```gulp android:run -e qa```<br/>
```gulp android:run -e homolog```<br/>
```gulp android:run -e production```

## Device Release

```gulp android:release -e sds```<br/>
```gulp android:release -e qa```<br/>
```gulp android:release -e homolog```<br/>
```gulp android:release -e production```
<br/>
<br/>
Para trocar o valor da versão independente do ambiente, ir no arquivo config/version.json