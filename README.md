# AWS CDK Wavelength Example
AWS CDKでWavelength環境を立ち上げるサンプルリポジトリです。

## デプロイされるリソース

![リソース図](/awscdkwavelength.png)

```
VPC **172.20.0.0/16** (AwsCdkWavelengthExampleStack/TokyoRegion)
  Subnet **172.20.0.0/26** (InternetZone_SubnetSubnet1)
    EC2 (JumpEC2) (t2.micro)
    Elastic IP(Public IP)
  Subnet **172.20.0.64/26** (InternetZone_SubnetSubnet2)
  Subnet **172.20.1.0/24** (Wavelength Tokyo) 
    EC2 (Wavelength Tokyo MEC) (t3.medium)
      Carrier IP (手動)
  Subnet **172.20.2.0/24** (Wavelength Osaka) 
    EC2 (Wavelength Osaka MEC) (t3.medium)
      Carrier IP (手動)
  Internet Gateway
  Carrier Gateway
```

## Setup

[公式のドキュメント](https://docs.aws.amazon.com/ja_jp/cdk/latest/guide/work-with-cdk-typescript.html)を参考に手元にAWS CDK Typescriptの環境を作りましょう。

AWS Wavelengthを有効化する必要があります。

[このページ](https://aws.amazon.com/jp/wavelength/locations/)から、KDDI Wavelength ZonesのGet Startedを押しましょう。

するとEC2のダッシュボードに飛ぶので、Manageを押してEnabledに変更しましょう。

## デプロイ方法

AWS CLIの設定のデフォルトリージョンがap-northeast-1になっていることを確認しましょう。

なっていない場合は変更しておきましょう。

```
$ aws configure
AWS Access Key ID [********************]: 
AWS Secret Access Key [********************]: 
Default region name [None]: ap-northeast-1
Default output format [None]: 
```

またSSHのkey pairを生成して、AWSにアップロードしておく必要があります。既に存在するキーペアを使う場合は以下のコマンドは飛ばしてください。

```
aws ec2 create-key-pair --key-name wavelengthExample --query "KeyMaterial" --output text > keyPair.pem
chmod 400 keyPair.pem
```

後はこのリポジトリをCloneして、以下のコマンドを実行するとデプロイできます。[既に存在するキーペア](https://ap-northeast-1.console.aws.amazon.com/ec2/v2/home?region=ap-northeast-1#KeyPairs:)を使う場合は、以下のコマンドの**wavelengthExample**を書き換えてください。
```
$ cdk deploy -c key_pair=wavelengthExample
```

デプロイしたのち、キャリアIPのみWeb Dashboardから手動で割り当てる必要があります。

[このページ](https://ap-northeast-1.console.aws.amazon.com/vpc/home?region=ap-northeast-1#AllocateAddress:)からキャリアIPを確保します。

Network Border GroupInfoを、**ap-northeast-1-wl1-nrt-wlz-1** または、**ap-northeast-1-wl1-kix-wlz-1**を入力して、Allocateを押します。

このサンプルだと東京リージョンと大阪リージョンに属するEC2があるので、それぞれのNetwork Border GroupのキャリアIPが必要です。

確保が終われば、[このページ](https://ap-northeast-1.console.aws.amazon.com/vpc/home?region=ap-northeast-1#Addresses:)から **Actions→Associate Elastic IP Address**で、EC2に割り当てます。

## SSH接続
もしSSHクライアントがKDDIのモバイル網につながっている場合は、直接MECに対してSSHすることができます。

ただしそうでない場合、作成したJumpEC2を踏み台にして接続する必要があります。

```
$ ssh -i keyPair.pem ec2-user@xx.xx.xx.xx(JumpEC2のElastic IP)
```

その踏み台のサーバー内でSSH接続します。

```
$ssh -i keyPair.pem ec2-user@172.20.xx.xx(接続したいMECのPrivate IP)
```

## 削除する場合
削除する場合は、以下のコマンドで削除できます。
```
$ cdk destroy
```

また手動で割り当てたキャリアIPは自動で削除されないので、手動で削除してください。
