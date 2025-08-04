# 注解
## 实体类注解
### @ApiModel 
位置：注解用于实体类，
功能：表示对类进行说明，用于参数用实体类接收。  
### @ApiModelProperty 
位置：注解用于类中属性，
功能：表示对 model 属性的说明或者数据操作更改。

## Controller 类中相关注解
### @Api 
位置：注解用于类上
功能：表示标识这个类是 swagger 的资源。  
### @ApiOperation
位置：注解用于方法
功能：表示一个 http 请求的操作。  
### @ApiImplicitParams
位置：方法上，存放的是`@ApiImplicitParam`数组
功能：描述方法的参数信息
#### @ApiImplicitParam
name: 参数名
value:参数说明
required:是否必填
paramType: 参数类型（query/path/form/body/header）
dataType: 参数数据类型
### @ApiParam
位置：注解用于参数上
功能：用来标明参数信息。

### @ApiOperationSupport(order=1)
位置：方法上
功能：方法级别排序，数字越小越优先


