import { labelizeRecord } from "@/utils/funcs";

import { 
    kind as formInputsKind, 
    type FieldDefs as FormInputsFieldDefs,
    useFormInputs
} from "@/hooks/FormInputs";
import { 
    kind as queryParamsKind, 
    type FieldDefs as QueryParamsFieldDefs,
    useQueryParams ,
} from '@/hooks/QueryParams';

import { 
    ServerException,
} from '@/core';

import { useAuthState } from './index';

import type { 
    UserInput, 
    UserSummary, 
    AdminSort, 
} from './schema';

import  { 
    adminSort,
    registration,
} from './schema';
import {
    useCreateMutation,
    usePatchPasswordMutation,
    usePatchMutation,
} from './service';


export {
    userFields,
    useRegisterFormInputs,
    useSetPasswordFormInputs,
    useUpdateFormInputs,
    useAdminSearchParams,
}

const userFields = (user?: UserSummary ) => ({
    name: {
        kind: formInputsKind.text,
        label: "Name",
        placeholder: "Name",
        validate: (v) => !v?.trim() ? "Name required" : null,
        initial: user?.name
    },
    email: {
        kind: formInputsKind.email,
        label: "Email",
        placeholder: "Email",
        initial: user?.email
    },
} satisfies FormInputsFieldDefs)

function useRegisterFormInputs({onSuccess}: {
    onSuccess?: () => void
}) {
    const { mutate } = useCreateMutation({onSuccess});
    return useFormInputs({
        fields: userFields(),
        onSubmit: (values, setErrorMsg) => 
            mutate(values as UserInput, {
                onError: (error) => {
                    if (error instanceof ServerException) setErrorMsg(error.message);
                }
        })
    })
}

function useUpdateFormInputs({onSuccess}: {
    onSuccess?: () => void
}) {
    const user = useAuthState(state => state.user)
    const { mutate } = usePatchMutation({});
    return useFormInputs({
        fields: userFields(user as UserSummary),
        onSubmit: (values, setErrorMsg, reset) => 
            mutate( values as UserInput, {
                onError(error) {
                    if (error instanceof ServerException) setErrorMsg(error.message);
                },
                onSuccess({user}) {
                    const { email, name } = user
                    reset({email, name})
                    onSuccess?.();
                }
        })
    })
}

function useSetPasswordFormInputs({onSuccess}: {
    onSuccess?: () => void
}) {
    const fields = {
        password: {
            kind: formInputsKind.password,
            label: "Password",
            validate: (v) => !v ? "Password required" : null
        },
        rePassword: {
            kind: formInputsKind.password,
            label: "Re-enter Password",
            validate: (v) => !v ? "Re-enter Password required" : null
        }
    } satisfies FormInputsFieldDefs

    const { mutate } = usePatchPasswordMutation({ onSuccess });

    return useFormInputs({
        fields,
        onSubmit: ( values, setErrorMsg) => 
            mutate( values.password as string, {
                onError: (error) => {
                    if (error instanceof ServerException) setErrorMsg(error.message);
                }
            })
    })
}

function useAdminSearchParams() {
    const adminSearchParams = {
        registration: {
            kind: queryParamsKind.selectMultiple,
            label: "Registration Type",
            options: registration,
            labels: labelizeRecord(registration)
        },
        sortBy: {
            kind: queryParamsKind.selectOne,
            label: "sortBy",
            defaultValue: 'createdAt' as AdminSort,
            options: adminSort,
            labels: labelizeRecord(adminSort)
        },
        search: {
            kind: queryParamsKind.text,
            label: "Search",
            placeholder: "Search"
        },
        isAscending: {
            kind: queryParamsKind.boolean,
            label: "Ascending",
        },
    } satisfies QueryParamsFieldDefs

    return useQueryParams(adminSearchParams, '/admin/users')
}
