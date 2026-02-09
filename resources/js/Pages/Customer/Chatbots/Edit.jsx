import { Head, Link, router, useForm } from '@inertiajs/react';
import CustomerLayout from '../../../Layouts/CustomerLayout';

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
const labelClass = 'block text-sm font-medium text-slate-700';

export default function CustomerChatbotsEdit({ chatbot, goalTypes, appUrl }) {
  const { data, setData, put, processing, errors } = useForm({
    name: chatbot.name,
    slug: chatbot.slug ?? '',
    goal_type: chatbot.goal_type ?? 'assistant',
    custom_goal: chatbot.custom_goal ?? '',
    widget_primary_color: chatbot.widget_primary_color ?? '#4f46e5',
    widget_position: chatbot.widget_position ?? 'bottom-right',
    widget_icon: null,
    remove_icon: false,
  });

  const submit = (e) => {
    e.preventDefault();
    const hasFile = data.widget_icon instanceof File;
    const removeIcon = !!data.remove_icon;
    if (hasFile || removeIcon) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', data.name);
      formData.append('slug', data.slug || '');
      formData.append('goal_type', data.goal_type);
      formData.append('custom_goal', data.goal_type === 'custom' ? (data.custom_goal || '') : '');
      formData.append('widget_primary_color', data.widget_primary_color || '');
      formData.append('widget_position', data.widget_position || '');
      formData.append('remove_icon', removeIcon ? '1' : '0');
      if (hasFile) formData.append('widget_icon', data.widget_icon);
      router.post(`/dashboard/chatbots/${chatbot.id}`, formData, { forceFormData: true });
    } else {
      put(`/dashboard/chatbots/${chatbot.id}`);
    }
  };

  return (
    <CustomerLayout>
      <Head title={`Modifica ${chatbot.name}`} />
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/chatbots" className="text-slate-600 hover:text-slate-900">
          ← Chatbot
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Modifica {chatbot.name}</h1>
      </div>

      <form
        onSubmit={submit}
        className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label htmlFor="name" className={labelClass}>Nome *</label>
          <input
            id="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className={inputClass}
          />
          {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="goal_type" className={labelClass}>Obiettivo</label>
          <select
            id="goal_type"
            value={data.goal_type}
            onChange={(e) => setData('goal_type', e.target.value)}
            className={inputClass}
          >
            {Object.entries(goalTypes || {}).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {data.goal_type === 'custom' && (
          <div>
            <label htmlFor="custom_goal" className={labelClass}>Obiettivo personalizzato</label>
            <textarea
              id="custom_goal"
              value={data.custom_goal}
              onChange={(e) => setData('custom_goal', e.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>
        )}

        <div className="border-t border-slate-200 pt-6">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Aspetto widget</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="widget_primary_color" className={labelClass}>Colore</label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="widget_primary_color"
                  type="color"
                  value={data.widget_primary_color}
                  onChange={(e) => setData('widget_primary_color', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={data.widget_primary_color}
                  onChange={(e) => setData('widget_primary_color', e.target.value)}
                  className={inputClass + ' max-w-[140px] font-mono'}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Posizione</label>
              <div className="mt-1.5 flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="widget_position"
                    value="bottom-right"
                    checked={data.widget_position === 'bottom-right'}
                    onChange={() => setData('widget_position', 'bottom-right')}
                    className="text-primary-600"
                  />
                  In basso a destra
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="widget_position"
                    value="bottom-left"
                    checked={data.widget_position === 'bottom-left'}
                    onChange={() => setData('widget_position', 'bottom-left')}
                    className="text-primary-600"
                  />
                  In basso a sinistra
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="widget_icon" className={labelClass}>Icona (opzionale)</label>
              <div className="mt-1.5 flex flex-wrap items-center gap-4">
                {(chatbot.widget_icon_url && !data.remove_icon) || (data.widget_icon instanceof File) ? (
                  <span className="flex h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {data.widget_icon instanceof File ? (
                      <img src={URL.createObjectURL(data.widget_icon)} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <img src={chatbot.widget_icon_url} alt="" className="h-full w-full object-contain" />
                    )}
                  </span>
                ) : null}
                <input
                  id="widget_icon"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setData('widget_icon', f || null);
                    if (f) setData('remove_icon', false);
                  }}
                  className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-100 file:px-3 file:py-1.5 file:text-primary-700"
                />
                {chatbot.widget_icon_url && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={data.remove_icon}
                      onChange={(e) => setData('remove_icon', e.target.checked)}
                    />
                    Rimuovi icona
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={processing}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Salva
          </button>
          <Link
            href="/dashboard/chatbots"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annulla
          </Link>
        </div>
      </form>
    </CustomerLayout>
  );
}
