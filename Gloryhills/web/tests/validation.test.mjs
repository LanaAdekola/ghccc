import test from 'node:test';
import assert from 'node:assert/strict';
import {contentInput,submissionInput} from '../lib/validation.ts';
import {dataFromForm,schedule} from '../lib/fields.ts';
const content={kind:'sermons',slug:'valid-message',title:'A message',description:'Description',body:'Body',external_url:'',starts_at:'',image_url:'',image_alt:'',status:'draft',display_order:0,seo_title:'',seo_description:'',data:{}};
test('content validation rejects unsafe URLs, missing image alt and incomplete published giving methods',()=>{assert.equal(contentInput.safeParse(content).success,true);assert.equal(contentInput.safeParse({...content,external_url:'javascript:alert(1)'}).success,false);assert.equal(contentInput.safeParse({...content,image_url:'photo.jpg'}).success,false);assert.equal(contentInput.safeParse({...content,kind:'giving_methods',status:'published'}).success,false);assert.equal(contentInput.safeParse({...content,kind:'giving_methods',status:'published',data:{bank_name:'Test bank',account_name:'Test account',account_number:'0000000000',currency:'NGN'}}).success,true);});
test('submission validation rejects missing consent, invalid email, honeypot and overlong text',()=>{const input={kind:'contact',name:'Test person',email:'test@example.test',message:'Test message content',consent:'on',website:'',token:'test-token'};assert.equal(submissionInput.safeParse(input).success,true);for(const patch of [{consent:''},{email:'bad'},{website:'spam'},{message:'a'.repeat(5001)}])assert.equal(submissionInput.safeParse({...input,...patch}).success,false);});
const times={location:'Ojodu Berger headquarters',day:'Sunday',start:'08:00',end:'13:00',timezone:'Africa/Lagos'};
test('structured field rules cover service times, settings links and email',()=>{
 assert.equal(contentInput.safeParse({...content,kind:'service_times',status:'published',data:times}).success,true);
 assert.equal(contentInput.safeParse({...content,kind:'service_times',status:'published',data:{...times,end:''}}).success,false);
 assert.equal(contentInput.safeParse({...content,kind:'service_times',status:'published',data:{...times,start:'14:00'}}).success,false);
 assert.equal(contentInput.safeParse({...content,kind:'service_times',data:{...times,start:'8am'}}).success,false);
 assert.equal(contentInput.safeParse({...content,kind:'gallery_images',status:'published'}).success,false);
 assert.equal(contentInput.safeParse({...content,kind:'settings',data:{email:'not-an-email'}}).success,false);
 assert.equal(contentInput.safeParse({...content,kind:'settings',data:{map_url:'http://maps.example'}}).success,false);
 assert.equal(schedule(times),'Sunday · 8:00 AM–1:00 PM WAT');
 assert.equal(schedule({day:'Sunday'}),'');
});
test('admin form fields become structured data without a JSON editor',()=>{
 const form=new FormData();
 form.set('title','Headquarters');form.set('data.day','Wednesday');form.set('data.start','18:00');form.set('data.swift','  ');
 form.set('order.0','welcome');form.set('order.1','');form.set('order.2','giving');form.set('order.3','welcome');
 assert.deepEqual(dataFromForm(form.entries()),{day:'Wednesday',start:'18:00',section_order:'welcome,giving'});
});
