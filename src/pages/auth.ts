import { createIcon, showToast } from '../components';
import { login } from '../api';
import { router, ROUTES } from '../router';
import { store, STATE_KEYS, saveUserToStorage } from '../store';

// 登录页面
export function renderLoginPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 flex flex-col';
  
  // 顶部区域
  const header = document.createElement('div');
  header.className = 'flex-1 flex flex-col items-center justify-center px-6 text-white';
  header.innerHTML = `
    <div class="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl mb-6">
      🎾
    </div>
    <h1 class="text-3xl font-bold mb-2">拍档</h1>
    <p class="text-blue-100">约球不孤单，打球更来电</p>
  `;
  
  // 登录表单
  const form = document.createElement('div');
  form.className = 'bg-white rounded-t-3xl px-6 py-8 flex-1';
  
  form.innerHTML = `
    <h2 class="text-xl font-bold text-gray-900 mb-6">手机号登录</h2>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">手机号</label>
        <div class="flex">
          <span class="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">+86</span>
          <input 
            type="tel" 
            id="login-phone"
            class="flex-1 px-4 py-3 rounded-r-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">验证码</label>
        <div class="flex gap-2">
          <input 
            type="text" 
            id="login-code"
            class="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            placeholder="请输入验证码"
            maxlength="6"
          />
          <button 
            id="send-code-btn"
            class="px-4 py-2 rounded-lg border border-blue-500 text-blue-500 font-medium text-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            发送验证码
          </button>
        </div>
      </div>
      
      <p class="text-xs text-gray-400 mt-2">演示模式：验证码填写 <span class="text-blue-500 font-mono">123456</span> 即可登录</p>
    </div>
    
    <div id="login-error" class="hidden mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm"></div>
    
    <div class="mt-6">
      <button 
        id="login-btn"
        class="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors active:scale-98"
      >
        登录
      </button>
    </div>
    
    <div class="mt-6 text-center">
      <p class="text-gray-500 text-sm">
        登录即表示同意
        <a href="#" class="text-blue-500">《用户协议》</a>
        和
        <a href="#" class="text-blue-500">《隐私政策》</a>
      </p>
    </div>
  `;
  
  container.appendChild(header);
  container.appendChild(form);
  
  // 绑定事件
  const phoneInput = form.querySelector('#login-phone') as HTMLInputElement;
  const codeInput = form.querySelector('#login-code') as HTMLInputElement;
  const sendCodeBtn = form.querySelector('#send-code-btn') as HTMLButtonElement;
  const loginBtn = form.querySelector('#login-btn') as HTMLButtonElement;
  const errorEl = form.querySelector('#login-error') as HTMLElement;
  
  // 发送验证码
  let countdown = 0;
  sendCodeBtn.addEventListener('click', () => {
    const phone = phoneInput.value.trim();
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showToast('请输入正确的手机号', 'error');
      return;
    }
    
    if (countdown > 0) return;
    
    countdown = 60;
    sendCodeBtn.textContent = `${countdown}秒后重发`;
    
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        sendCodeBtn.textContent = '发送验证码';
      } else {
        sendCodeBtn.textContent = `${countdown}秒后重发`;
      }
    }, 1000);
    
    showToast('验证码已发送', 'success');
  });
  
  // 登录
  loginBtn.addEventListener('click', async () => {
    const phone = phoneInput.value.trim();
    const code = codeInput.value.trim();
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      errorEl.textContent = '请输入正确的手机号';
      errorEl.classList.remove('hidden');
      return;
    }
    
    if (!/^\d{6}$/.test(code)) {
      errorEl.textContent = '请输入6位验证码';
      errorEl.classList.remove('hidden');
      return;
    }
    
    errorEl.classList.add('hidden');
    loginBtn.textContent = '登录中...';
    loginBtn.disabled = true;
    
    try {
      const response = await login(phone, code);
      
      if (response.success && response.data) {
        saveUserToStorage(response.data, 'mock-token');
        store.setState(STATE_KEYS.USER, response.data);
        showToast('登录成功', 'success');
        router.navigate(ROUTES.HOME);
      } else {
        errorEl.textContent = response.error || '登录失败';
        errorEl.classList.remove('hidden');
      }
    } catch {
      errorEl.textContent = '网络错误，请重试';
      errorEl.classList.remove('hidden');
    } finally {
      loginBtn.textContent = '登录';
      loginBtn.disabled = false;
    }
  });
  
  return container;
}

// 注册页面
export function renderRegisterPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-white';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'flex items-center justify-between px-4 py-4 border-b border-gray-100';
  header.innerHTML = `
    <button id="back-btn" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
      ${createIcon('chevronLeft', 'w-6 h-6')}
    </button>
    <h1 class="text-lg font-semibold text-gray-900">完善资料</h1>
    <div class="w-10"></div>
  `;
  
  // 表单
  const form = document.createElement('div');
  form.className = 'p-6';
  
  form.innerHTML = `
    <div class="flex flex-col items-center mb-6">
      <div class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-4 cursor-pointer hover:bg-gray-200 transition-colors" id="avatar-upload">
        👤
      </div>
      <p class="text-gray-500 text-sm">点击上传头像</p>
    </div>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
        <input 
          type="text" 
          id="nickname"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          placeholder="给自己起个昵称"
          maxlength="20"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">性别</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="gender" value="male" class="w-4 h-4 text-blue-500" />
            <span>男</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="gender" value="female" class="w-4 h-4 text-blue-500" />
            <span>女</span>
          </label>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">运动水平</label>
        <select 
          id="level"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
        >
          <option value="beginner">新手级 - 刚学不久，能打几个回合</option>
          <option value="entry">入门级 - 有基础，能进行简单对抗</option>
          <option value="intermediate">中级 - 可以打比赛，有一定战术</option>
          <option value="advanced">高级 - 技术全面，经常参加比赛</option>
          <option value="expert">高手级 - 专业或半专业水平</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
        <textarea 
          id="bio"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
          placeholder="介绍一下自己，让大家更了解你"
          rows="3"
          maxlength="200"
        ></textarea>
      </div>
    </div>
    
    <div class="mt-6">
      <button 
        id="complete-btn"
        class="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        完成注册
      </button>
    </div>
  `;
  
  container.appendChild(header);
  container.appendChild(form);
  
  // 绑定事件
  header.querySelector('#back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.LOGIN);
  });
  
  form.querySelector('#complete-btn')?.addEventListener('click', () => {
    const nickname = (form.querySelector('#nickname') as HTMLInputElement).value.trim();
    
    if (!nickname) {
      showToast('请输入昵称', 'error');
      return;
    }
    
    showToast('注册成功', 'success');
    router.navigate(ROUTES.HOME);
  });
  
  return container;
}
