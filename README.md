# AWS CDK Wavelength Example
AWS CDKでWavelength環境を立ち上げるサンプルリポジトリです。

## デプロイされるリソース

![リソース図](/awscdkwavelength.png)

- VPC **172.20.0.0/16** (AwsCdkWavelengthExampleStack/TokyoRegion)
- Subnet **172.20.0.0/26** (InternetZone_SubnetSubnet1)
- EC2 (JumpEC2) (t2.micro)
- Elastic IP(Public IP)
- Subnet **172.20.0.64/26** (InternetZone_SubnetSubnet2)
- Subnet **172.20.1.0/24** (Wavelength Tokyo) 
- EC2 (Wavelength Tokyo MEC) (t3.medium)
- Carrier IP (手動)
- Subnet **172.20.2.0/24** (Wavelength Osaka) 
- EC2 (Wavelength Osaka MEC) (t3.medium)
- Carrier IP (手動)
- Internet Gateway
- Carrier Gateway

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

後はこのリポジトリをCloneして、以下のコマンドを実行するとデプロイできます。
```
$ cdk deploy
```

デプロイしたのち、キャリアIPのみWeb Dashboardから手動で割り当てる必要があります。

[このページ](https://ap-northeast-1.console.aws.amazon.com/vpc/home?region=ap-northeast-1#AllocateAddress:)からキャリアIPを確保します。

Network Border GroupInfoを、**ap-northeast-1-wl1-nrt-wlz-1** または、**ap-northeast-1-wl1-kix-wlz-1**を入力して、Allocateを押します。

このサンプルだと東京リージョンと大阪リージョンに属するEC2があるので、それぞれのNetwork Border GroupのキャリアIPが必要です。

確保が終われば、[ここ](https://ap-northeast-1.console.aws.amazon.com/vpc/home?region=ap-northeast-1#Addresses:)から **Actions→Associate Elastic IP Address**で、EC2に割り当てます。

## 削除する場合
削除する場合は、以下のコマンドで削除できます。
```
$ cdk destroy
```

また手動で割り当てたキャリアIPは自動で削除されないので、手動で削除してください。
