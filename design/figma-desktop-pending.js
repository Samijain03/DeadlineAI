
await Promise.all(['Regular','Medium','SemiBold','Bold'].map(style=>figma.loadFontAsync({family:'DM Sans',style})));
const vs=await figma.variables.getLocalVariablesAsync();const V=Object.fromEntries(vs.map(v=>[v.name,v]));
const ts=await figma.getLocalTextStylesAsync();const T=Object.fromEntries(ts.map(s=>[s.name.split('/').pop(),s]));
const made=[],changed=[];const track=n=>(made.push(n.id),n);
function paint(name){return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',V['color/'+name]);}
function fill(n,name){n.fills=name?[paint(name)]:[];}
function space(n,prop,val){n[prop]=val;if(V['space/'+val])n.setBoundVariable(prop,V['space/'+val]);}
function rad(n,val){n.cornerRadius=val;if(V['radius/'+val])n.setBoundVariable('cornerRadius',V['radius/'+val]);}
function box(parent,name,w,dir='VERTICAL',gap=16,pad=0,bg=null,r=0){const n=track(figma.createAutoLayout(dir));n.name=name;if(parent)parent.appendChild(n);n.resize(w,10);n.primaryAxisSizingMode=dir==='VERTICAL'?'AUTO':'FIXED';n.counterAxisSizingMode=dir==='VERTICAL'?'FIXED':'AUTO';space(n,'itemSpacing',gap);for(const p of ['paddingTop','paddingBottom','paddingLeft','paddingRight'])space(n,p,pad);fill(n,bg);if(r)rad(n,r);return n;}
async function txt(parent,content,style='Body',color='text',width){const n=track(figma.createText());n.name=content.slice(0,50);n.fontName=T[style].fontName;n.characters=content;await n.setTextStyleIdAsync(T[style].id);fill(n,color);parent.appendChild(n);if(width){n.textAutoResize='HEIGHT';n.resize(width,n.height);}return n;}
function border(n,color='border'){n.strokes=[paint(color)];space(n,'strokeWeight',1);}
function spacer(parent,height){const n=box(parent,'Space',1);n.resize(1,height);n.primaryAxisSizingMode='FIXED';return n;}
function fixed(n,w,h){n.resize(w,h);n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='FIXED';return n;}
function collect(n){made.push(n.id);if('children'in n)for(const c of n.children)collect(c);}

const CM={"button":{"set":"6:16","variants":[{"id":"6:6","name":"State=Primary"},{"id":"6:8","name":"State=Hover"},{"id":"6:10","name":"State=Focus"},{"id":"6:12","name":"State=Secondary"},{"id":"6:14","name":"State=Disabled"}]},"field":{"set":"6:32","variants":[{"id":"6:17","name":"State=Default"},{"id":"6:22","name":"State=Focus"},{"id":"6:27","name":"State=Needs review"}]},"task":{"set":"6:48","variants":[{"id":"6:33","name":"State=Upcoming"},{"id":"6:38","name":"State=Due soon"},{"id":"6:43","name":"State=Completed"}]}};
async function instance(parent,kind,state,props={},w){const def=CM[kind].variants.find(v=>v.name==='State='+state);const master=await figma.getNodeByIdAsync(def.id);const n=master.createInstance();parent.appendChild(n);const keys=Object.keys(n.componentProperties);const values={};for(const [key,val] of Object.entries(props)){const pk=keys.find(k=>k.split('#')[0]===key);if(pk)values[pk]=val;}n.setProperties(values);if(w)n.resize(w,n.height);collect(n);return n;}
async function button(parent,label,w=180,secondary=false){const n=await instance(parent,'button',secondary?'Secondary':'Primary',{Label:label},w);n.name='Action / '+label;return n;}
const links=[];function target(n,to){links.push({from:n.id,to});return n;}
async function badge(parent,label,bg='successSurface',color='success'){const n=box(parent,label,150,'HORIZONTAL',8,8,bg,999);n.primaryAxisSizingMode='AUTO';n.counterAxisSizingMode='AUTO';await txt(n,label,'Caption',color);return n;}
async function shell(name,x,y,step){const root=box(figma.currentPage,name,1440,'HORIZONTAL',0,0,'background');fixed(root,1440,1000);root.x=x;root.y=y;root.clipsContent=true;
const side=box(root,'Sidebar',224,'VERTICAL',16,24,'surface');fixed(side,224,1000);border(side);await txt(side,'◒  DeadlineAI','Subtitle','text',176);spacer(side,32);
for(const label of ['Today','Notices','Calendar','Reminders']){const item=box(side,'Nav / '+label,176,'HORIZONTAL',8,12,label==='Today'?'successSurface':null,12);await txt(item,label,'Label',label==='Today'?'success':'secondary');if(label==='Today')target(item,'Today');}
spacer(side,360);const hint=box(side,'Student workspace',176,'VERTICAL',8,16,'background',16);await txt(hint,'A little more headspace.','Label','text',144);await txt(hint,'Your college life,\none clear step at a time.','Caption','secondary',144);spacer(side,20);await txt(side,'SJ   Samay Jain','Label','text',176);await txt(side,'Student workspace','Caption','secondary',176);
const main=box(root,'Main',1216,'VERTICAL',24,48);fixed(main,1216,1000);
const top=box(main,'Top bar',1120,'HORIZONTAL',16);top.counterAxisAlignItems='CENTER';await txt(top,step||'YOUR SPACE, AT YOUR PACE','Caption','secondary',850);await badge(top,'Preview · sample data','background','secondary');
return {root,main};
}
async function title(parent,kicker,heading,body){await txt(parent,kicker,'Label','success',1120);await txt(parent,heading,'Title','text',1120);if(body)await txt(parent,body,'Body','secondary',1120);}
async function steps(parent,active){const r=box(parent,'Progress',1120,'HORIZONTAL',16);for(const [i,label] of ['Add notice','Review details','Save & remind'].entries()){const b=box(r,label,220,'HORIZONTAL',8,12,i===active?'successSurface':null,12);await txt(b,(i<active?'✓':String(i+1))+'  '+label,'Label',i===active?'success':'secondary');}}
async function notice(parent,w){const card=box(parent,'Original notice',w,'VERTICAL',20,32,'surface',16);border(card);await txt(card,'ORIGINAL NOTICE · SAMPLE','Caption','secondary',w-64);await txt(card,'Merit scholarship\napplications are open.','Heading','text',w-64);await txt(card,'Student Affairs Office\n24 September 2026','Caption','secondary',w-64);await txt(card,'Applications are invited from students with a CGPA of 8.0 or above.','Body','text',w-64);
const mark=box(card,'Source / Action and date',w-64,'VERTICAL',12,16,'warningSurface',8);await txt(mark,'Submit the scholarship form and your latest marksheet by 30 September 2026, 5:00 PM.','Body','text',w-96);await txt(card,'Apply through the student portal. Keep the acknowledgement for your records.','Body','secondary',w-64);return card;}

await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('4:2'));
if(figma.currentPage.children.some(n=>n.name==='Today'))return {alreadyExists:true};
const screens={};
// Today
let s=await shell('Today',100,100);screens.Today=s.root.id;
let h=box(s.main,'Welcome',1120,'HORIZONTAL',24);let hcopy=box(h,'Greeting',872,'VERTICAL',8);await txt(hcopy,'Thursday, 24 September','Label','secondary',872);await txt(hcopy,'A clearer day starts here, Samay.','Title','text',872);target(await button(h,'+ Add a notice',224),'Add');
let cols=box(s.main,'Dashboard content',1120,'HORIZONTAL',24);let left=box(cols,'Your priorities',720,'VERTICAL',24);let right=box(cols,'Week and outlook',376,'VERTICAL',24);
const focus=box(left,'Next up',720,'VERTICAL',16,32,'text',24);await txt(focus,'NEXT UP  /  DUE TOMORROW','Label','accent',656);await txt(focus,'One payment.\nOne less thing on your mind.','Title','surface',656);await txt(focus,'Pay your semester fees by Friday, 25 Sep · 5:00 PM.','Body','surface',656);target(await button(focus,'View fee task →',200,true),'Fee task');
await txt(left,'Coming up','Subtitle','text',720);
target(await instance(left,'task','Upcoming',{},720),'Exam task');
const hint=box(left,'Upload encouragement',720,'HORIZONTAL',24,24,'warningSurface',16);let ht=box(hint,'Copy',450,'VERTICAL',4);await txt(ht,'A new notice in the group chat?','Label','warningText',450);await txt(ht,'Add it here. We’ll help find the next step.','Body','text',450);target(await button(hint,'Add notice',174,true),'Add');
const week=box(right,'Week strip',376,'VERTICAL',20,24,'surface',24);await txt(week,'Your next seven days','Subtitle','text',328);await txt(week,'24–30 September','Caption','secondary',328);const dates=box(week,'Dates',328,'HORIZONTAL',8);
for(const [day,num,color] of [['T','24','text'],['F','25','warningSurface'],['S','26','background'],['S','27','background'],['M','28','successSurface'],['T','29','background'],['W','30','background']]){const cell=box(dates,'Day '+num,40,'VERTICAL',8,8,color,12);await txt(cell,day,'Caption',color==='text'?'surface':'secondary');await txt(cell,num,'Label',color==='text'?'surface':'text');}
await txt(week,'2 tasks coming up\nNothing overdue. You’re on track.','Body','secondary',328);
const calm=box(right,'Breathing room',376,'VERTICAL',16,24,'successSurface',24);await txt(calm,'Make room for your week.','Heading','success',328);await txt(calm,'Check your notices now, then get back to the things you enjoy.','Body','text',328);await txt(calm,'✓  3 tasks completed this week','Label','success',328);
// Add
s=await shell('Add',1640,100,'ADD A NOTICE');screens.Add=s.root.id;await steps(s.main,0);await title(s.main,'LESS READING. MORE CLARITY.','What landed in your inbox?','Add a college notice and we’ll look for the action, deadline and eligibility.');
let content=box(s.main,'Upload layout',1120,'HORIZONTAL',32);let upload=box(content,'Upload panel',704,'VERTICAL',24,40,'surface',24);border(upload);
await txt(upload,'↑','Display','success',624);await txt(upload,'Drop your notice here','Heading','text',624);await txt(upload,'PDF, JPG or PNG. A clear screenshot works too.','Body','secondary',624);target(await button(upload,'Choose a file',224),'Processing');await txt(upload,'Prototype: this opens a sample scholarship notice.','Caption','secondary',624);target(await button(upload,'Try the sample notice',264,true),'Processing');
let aside=box(content,'What happens next',384,'VERTICAL',24,32,'successSurface',24);await txt(aside,'You get the final say.','Heading','success',320);await txt(aside,'1. We read the notice.\n\n2. You check the important details.\n\n3. Save the task and choose a reminder.','Body','text',320);await txt(aside,'Nothing is added to your tasks until you confirm.','Label','success',320);
const recovery=box(s.main,'Prototype scenarios',1120,'HORIZONTAL',16);target(await button(recovery,'Preview upload error',240,true),'Upload error');target(await button(recovery,'Enter details manually',264,true),'Manual');
// Processing
s=await shell('Processing',3180,100,'ADD A NOTICE');screens.Processing=s.root.id;await steps(s.main,0);await title(s.main,'FINDING THE IMPORTANT PARTS','A little reading, handled.','Scholarship application.pdf · Sample notice');
let processing=box(s.main,'Processing card',1120,'VERTICAL',24,48,'surface',24);await txt(processing,'◒','Display','success',1024);await txt(processing,'Looking for actions and dates…','Heading','text',1024);await txt(processing,'Your notice stays here while we prepare the details for you to review.','Body','secondary',1024);await txt(processing,'✓  File received\n✓  Text found\n○  Finding the next step','Body','success',1024);target(await button(processing,'Preview extracted details',280),'Review');target(await button(processing,'Cancel',140,true),'Add');
// Review
s=await shell('Review',100,1200,'REVIEW DETAILS');screens.Review=s.root.id;await steps(s.main,1);await title(s.main,'YOU’RE IN CONTROL','Does this look right?','Check these details against the notice before adding the task.');
let review=box(s.main,'Review workspace',1120,'HORIZONTAL',32);await notice(review,496);
let form=box(review,'Extracted details',592,'VERTICAL',16);
await instance(form,'field','Default',{Label:'What you need to do',Value:'Apply for the merit scholarship',Hint:'Submit the form and latest marksheet.'},592);
await instance(form,'field','Default',{Label:'Deadline',Value:'30 Sep 2026 · 5:00 PM',Hint:'Wednesday · Asia/Kolkata'},592);
await instance(form,'field','Default',{Label:'Who can apply',Value:'Students with CGPA 8.0 or above',Hint:'Check that this requirement applies to you.'},592);
const remind=box(form,'Reminder setting',592,'HORIZONTAL',16,16,'successSurface',12);await txt(remind,'✓  Remind me 1 day before, at 9:00 AM','Label','success',560);
let actions=box(form,'Review actions',592,'HORIZONTAL',16);target(await button(actions,'Save task & reminder',284),'Saved');target(await button(actions,'Edit deadline',220,true),'Check date');
const scenarios=box(form,'Review scenarios',592,'HORIZONTAL',16);target(await button(scenarios,'Preview missing date',264,true),'Check date');target(await button(scenarios,'Preview save error',264,true),'Save error');
// Saved
s=await shell('Saved',1640,1200,'TASK SAVED');screens.Saved=s.root.id;await steps(s.main,2);
const saved=box(s.main,'Success card',1120,'VERTICAL',24,48,'successSurface',32);await txt(saved,'✓','Display','success',1024);await txt(saved,'One less thing to remember.','Title','text',1024);await txt(saved,'Your scholarship task is saved.','Subtitle','success',1024);await txt(saved,'Due Wednesday, 30 September · 5:00 PM\nReminder: Tuesday, 29 September · 9:00 AM','Body','text',1024);const sa=box(saved,'Next actions',1024,'HORIZONTAL',16);target(await button(sa,'View task',224),'Task');target(await button(sa,'Back to Today',224,true),'Today updated');await txt(saved,'Prototype confirmation · Live app must wait for a successful save response.','Caption','secondary',1024);
// Task
s=await shell('Task',3180,1200,'TASK DETAILS');screens.Task=s.root.id;
await title(s.main,'SCHOLARSHIP · DUE 30 SEP','Apply for the merit scholarship','A clear next step, with the original notice close by.');
const taskrow=box(s.main,'Task workspace',1120,'HORIZONTAL',32);const task=box(taskrow,'Task content',680,'VERTICAL',24,32,'surface',24);border(task);
await txt(task,'What you need to do','Heading','text',616);await txt(task,'1. Complete the scholarship form.\n\n2. Attach your latest marksheet.\n\n3. Submit through the student portal and keep the acknowledgement.','Body','text',616);
await txt(task,'Who can apply','Label','secondary',616);await txt(task,'Students with CGPA 8.0 or above.','Body','text',616);target(await button(task,'Mark as complete',256),'Completed');
const meta=box(taskrow,'Due date and source',408,'VERTICAL',24,32,'successSurface',24);await txt(meta,'30','Display','success',344);await txt(meta,'September · Wednesday\n5:00 PM · Asia/Kolkata','Body','text',344);await txt(meta,'Reminder\n29 Sep · 9:00 AM','Body','secondary',344);target(await button(meta,'View original notice',280,true),'Review');
return {createdNodeIds:made,screens,links,frames:Object.entries(screens).map(([name,id])=>({name,id,width:1440,height:1000})),font:'DM Sans'};

