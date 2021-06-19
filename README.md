# AWS CDK Wavelength Example
AWS CDKでWavelength環境を立ち上げるサンプルリポジトリです。

## Setup

[公式のドキュメント](https://docs.aws.amazon.com/ja_jp/cdk/latest/guide/work-with-cdk-typescript.html)を参考に手元にAWS CDK Typescriptの環境を作りましょう。

AWS Wavelengthを有効化する必要があります。

[このページ](https://aws.amazon.com/jp/wavelength/locations/)から、KDDI Wavelength ZonesのGet Startedを押しましょう。

するとEC2のダッシュボードに飛ぶので、Manageを押してEnabledに変更しましょう。

## How to Deploy

AWS CLIの設定のデフォルトリージョンがap-northeast-1になっていることを確認しましょう。

なっていない場合は変更しておきましょう。

```
$ aws configure
AWS Access Key ID [********************]: 
AWS Secret Access Key [********************]: 
Default region name [None]: ap-northeast-1
Default output format [None]: 
```

後はこのリポジトリをCloneして、以下のコマンドを実行するとデプロイできます。
```
$ cdk deploy
```
