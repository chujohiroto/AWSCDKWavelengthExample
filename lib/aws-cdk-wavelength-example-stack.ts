import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2'
import { ISubnet } from '@aws-cdk/aws-ec2';

export class AwsCdkWavelengthExampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // The code that defines your stack goes here

    const vpc = new ec2.Vpc(this, 'TokyoRegion', {
      cidr: "172.20.0.0/16",
      defaultInstanceTenancy: ec2.DefaultInstanceTenancy.DEFAULT,
      subnetConfiguration: [{
        cidrMask: 26,
        subnetType: ec2.SubnetType.PUBLIC,
        name: 'InternetZone_Subnet'
      }]
    })

    new ec2.CfnCarrierGateway(this, "cgw", {
      vpcId: vpc.vpcId
    })

    new JumpEC2(this, vpc, vpc.publicSubnets[0])

    const zoneNRT = new WavelengthNRTZone(this, vpc)
    new WavelengthEC2(this, vpc, zoneNRT.subnet)

    const zoneKIX = new WavelengthKIXZone(this, vpc)
    new WavelengthEC2(this, vpc, zoneKIX.subnet)
  }
}


interface Zone {
  subnet: ec2.ISubnet
}

export class WavelengthNRTZone implements Zone {
  subnet: ec2.ISubnet

  constructor(stack: cdk.Stack, vpc: ec2.Vpc) {
    const cfnsubnet = new ec2.CfnSubnet(stack, "WavelengthNRTZone_Subnet", {
      vpcId: vpc.vpcId,
      cidrBlock: "172.20.1.0/24",
      availabilityZone: "ap-northeast-1-wl1-nrt-wlz-1",
    })

    const RouteTable = new ec2.CfnRouteTable(stack, "WavelengthNRTZone_RouteTable", {
      vpcId: vpc.vpcId
    })

    new ec2.CfnSubnetRouteTableAssociation(stack, "WavelengthNRTZone_RouteTableAssociation", {
      routeTableId: RouteTable.ref,
      subnetId: cfnsubnet.ref
    })

    this.subnet = ec2.Subnet.fromSubnetAttributes(stack, "WavelengthNRTZone_Subnet_FromID", {
      subnetId: cfnsubnet.ref,
      availabilityZone: cfnsubnet.availabilityZone,
      ipv4CidrBlock: cfnsubnet.cidrBlock
    })
  }
}

export class WavelengthKIXZone implements Zone {
  subnet: ec2.ISubnet

  constructor(stack: cdk.Stack, vpc: ec2.Vpc) {
    const cfnsubnet = new ec2.CfnSubnet(stack, "WavelengthKIXZone_Subnet", {
      vpcId: vpc.vpcId,
      cidrBlock: "172.20.2.0/24",
      availabilityZone: "ap-northeast-1-wl1-kix-wlz-1",
    })

    const RouteTable = new ec2.CfnRouteTable(stack, "WavelengthKIXZone_RouteTable", {
      vpcId: vpc.vpcId
    })

    new ec2.CfnSubnetRouteTableAssociation(stack, "WavelengthKIXZone_RouteTableAssociation", {
      routeTableId: RouteTable.ref,
      subnetId: cfnsubnet.ref
    })

    this.subnet = ec2.Subnet.fromSubnetAttributes(stack, "WavelengthKIXZone_Subnet_FromID", {
      subnetId: cfnsubnet.ref,
      availabilityZone: cfnsubnet.availabilityZone,
      ipv4CidrBlock: cfnsubnet.cidrBlock
    })
  }
}

export class JumpEC2 {
  constructor(stack: cdk.Stack, vpc: ec2.Vpc, subnet: ISubnet) {
    const SecurityGroup = new ec2.SecurityGroup(stack, "JumpEC2_SecurityGroup", {
      vpc: vpc,
      securityGroupName: "JumpEC2_SecurityGroup"
    })

    SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.icmpPing())
    SecurityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.icmpPing())
    SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22))
    SecurityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(22))

    const JumpEC2 = new ec2.Instance(stack, "JumpEC2", {
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: new ec2.AmazonLinuxImage,
      vpc: vpc,
      vpcSubnets: { subnets: [subnet] },
      securityGroup: SecurityGroup
    })

    const CareerIP = new ec2.CfnEIP(stack, "JumpEC2_CfnEIP", {
      instanceId: JumpEC2.instanceId
    });
  }
}

export class WavelengthEC2 {
  constructor(stack: cdk.Stack, vpc: ec2.Vpc, subnet: ISubnet) {
    const SecurityGroup = new ec2.SecurityGroup(stack, subnet.availabilityZone + "_WavelengthEC2_SecurityGroup", {
      vpc: vpc,
      securityGroupName: subnet.availabilityZone + "_WavelengthEC2_SecurityGroup"
    })

    SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.icmpPing())
    SecurityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.icmpPing())
    SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22))
    SecurityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(22))

    const WavelengthEC2 = new ec2.Instance(stack, subnet.availabilityZone + "_WavelengthMEC", {
      instanceType: new ec2.InstanceType("t3.medium"),
      machineImage: new ec2.AmazonLinuxImage,
      vpc: vpc,
      vpcSubnets: { subnets: [subnet] },
      securityGroup: SecurityGroup
    })
  }
}
