#### <font style="color:rgb(79, 79, 79);">实体类注解</font>
<font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);"> @ApiModel </font><font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);"> 注解用于实体类，表示对类进行说明，用于参数用实体类接收。</font>  
<font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);">@ApiModelProperty</font><font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);"> 注解用于类中属性，表示对 model 属性的说明或者数据操作更改。</font>

#### <font style="color:rgb(79, 79, 79);">Controller 类中相关注解</font>
<font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);">@Api</font><font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);"> 注解用于类上，表示标识这个类是 swagger 的资源。  
</font>
<font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);">@ApiOperation</font><font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);"> 注解用于方法，表示一个 http 请求的操作。  
</font>
<font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);">@ApiParam</font><font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);"> 注解用于参数上，用来标明参数信息。</font>

<font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);">@ApiOperationSupport(order =1)</font><font style="color:rgb(79, 79, 79);background-color:rgb(238, 240, 244);">方法级别排序，数字越小越优先</font>

