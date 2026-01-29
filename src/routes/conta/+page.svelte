<script>
	// @ts-nocheck
	import { user } from '$lib/userStore';
	import { onMount } from 'svelte';
	export let form;

	let nome = '';
	let email = '';

	onMount(() => {
		if ($user) {
			nome = $user.nome;
			email = $user.email;
		}
	});
</script>

<main class="account-page">
    <div class="account-wrapper">

        <h1 class="page-title">Perfil</h1>

        <form method="POST" enctype="multipart/form-data" class="account-card">

            <!-- COLUNA ESQUERDA -->
            <div class="left-panel">

                <!-- FOTO / AVATAR -->
                <label class="avatar-upload">
                    <div class="avatar">
                        <span>{$user?.nome?.charAt(0) || 'U'}</span>
                    </div>
                    <input type="file" name="foto" accept="image/*" hidden />
                </label>

                <!-- NOME -->
                <input name="nome" bind:value={nome} class="name-input" />
            </div>

            <!-- COLUNA DIREITA -->
            <div class="right-panel">

                <!-- EMAIL -->
                <div class="section">
                    <h3>Email</h3>
                    <input name="email" bind:value={email} class="name-input" />
                </div>

                <!-- PASSWORD -->
                <div class="section">
                    <h3>Alterar Palavra-Passe</h3>

                    <input
                        name="password_atual"
                        type="password"
                        placeholder="Palavra-passe atual"
                    />

                    <input
                        name="nova_password"
                        type="password"
                        placeholder="Nova palavra-passe"
                    />

                    <input
                        name="confirmar_password"
                        type="password"
                        placeholder="Confirmar nova palavra-passe"
                    />
                </div>

            </div>

            <!-- BOTÃO FINAL -->
            <button type="submit" class="save-all-btn">
                Guardar Alterações
            </button>

        </form>
    </div>
</main>



<style>

    .page-title {
        width: 100%;
        max-width: 1000px;
        margin-bottom: 30px;
        color: #e0e0e0;
        font-size: 2em;
        font-weight: 600;
        text-align: center;
    }
    
    .account-wrapper {
        width: 100%;
        max-width: 900px;
        display: flex;
        flex-direction: column;
    }


    .account-page {
        min-height: 90vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(45deg, #1a1a2e, #0f3460);
        padding: 20px;
    }

    .account-card {
        display: flex;
        gap: 40px;
        background: rgba(22, 22, 45, 0.95);
        border-radius: 16px;
        padding: 40px;
        max-width: 900px;
        width: 100%;
        border: 1px solid #3f3f5f;
        flex-wrap: wrap;
    }

    .account-card > .save-all-btn {
        flex-basis: 100%;
    }

    /* LEFT */
    .left-panel {
        width: 260px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
    }

    .avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: #ff0000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3em;
        font-weight: bold;
        color: white;
    }

    .name-input {
        width: 100%;
        padding: 12px;
        background: #111126;
        border: 1px solid #3f3f5f;
        color: white;
        border-radius: 8px;
        text-align: center;
    }

    /* RIGHT */
    .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 30px;
    }

    .section {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .section h3 {
        margin-bottom: 10px;
        color: #e0e0e0;
    }

    .section input {
        width: 100%;
        padding: 12px;
        background: #111126;
        border: 1px solid #3f3f5f;
        color: white;
        border-radius: 8px;
        margin-bottom: 12px;
    }

    .save-all-btn {
        margin-top: 10px;
        width: 100%;
        background: #ff0000;
        color: white;
        border: none;
        padding: 16px;
        font-size: 1.1em;
        font-weight: bold;
        border-radius: 12px;
        cursor: pointer;
        transition: 0.3s;
    }

    .save-all-btn:hover {
        background: #d60000;
    }

    .avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff0000, #b30000);
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }




    /* MOBILE */
    @media (max-width: 800px) {
        .account-card {
            flex-direction: column;
            align-items: center;
        }

        .left-panel {
            width: 100%;
        }
    }

</style>
